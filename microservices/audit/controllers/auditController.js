// controller/authController.js

const nodemailer = require('nodemailer');


const Audit = require('../models/auditModel'); // Asegúrate de que la ruta sea correcta

const createExamSession = async (req, res) => {
  const { sessionName } = req.body;
  const email = req.user.email; // asumiendo que tu middleware de auth pone el email en req.user

  try {
    const sessionId = await Audit.createExamSession({ email, sessionName });
    return res
      .status(201)
      .json({ message: 'Exam session created', sessionId });
  } catch (error) {
    console.error('Error creating exam session:', error);
    return res
      .status(500)
      .json({ message: 'Error creating exam session' });
  }
};


const logAlert = async (req, res) => {
  const { sessionId, type, description, frame } = req.body;
  const email = req.user.email;

  try {
    const auditLog = await Audit.logAlert({
      email,
      sessionId,
      type,
      description,
      frame
    });
    return res
      .status(201)
      .json({ message: 'Alert logged successfully', auditLog });
  } catch (error) {
    console.error('Error logging alert:', error);
    return res
      .status(500)
      .json({ message: 'Error logging alert' });
  }
};


const getAllByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;  // viene del middleware
    console.log('🔍 getAllByUser for userId=', userId);

    // Llamamos a la nueva función que no requiere fechas
    const audits = await Audit.getAllByUser(userId);

    console.log('📨 returning audits:', audits);
    return res.status(200).json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return res.status(500).json({ message: 'Error fetching audits' });
  }
};

const getAlertsPaginated = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate;    // opcional
    const endDate = req.query.endDate;      // opcional
    const examName = req.query.examName;     // opcional
    console.log(`🔍 getAlertsPaginated userId=${userId} page=${page} limit=${limit} offset=${offset} startDate=${startDate} endDate=${endDate} examName=${examName}`);
    // Datos paginados
    const data = await Audit.getByUserPaginated(
      userId,
      limit,
      offset,
      startDate,
      endDate,
      examName
    );
    // Total para calcular totalPages
    const total = await Audit.countByUser(
      userId,
      startDate,
      endDate,
      examName
    );

    return res.json({ data, total, page, limit });
  } catch (err) {
    console.error('Error en getAlertsLimited:', err);
    return res.status(500).json({ message: 'Error fetching paginated alerts' });
  }
};


const getFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const dataURL = await Audit.getFrameById(id, userId);

    //console.log(`🔍 getFrame id=${id} userId=${userId} ➞ dataURL:`, dataURL?.slice(0,50));

    if (!dataURL) {
      return res.sendStatus(404);
    }

    // separa el mime y el base64
    const [meta, b64] = dataURL.split(',');
    const m = meta.match(/^data:(image\/\w+);base64$/);
    if (!m) {
      return res.status(500).send('Formato de Data-URL inválido');
    }
    const mime = m[1];
    const buf = Buffer.from(b64, 'base64');

    res.set('Content-Type', mime);
    res.send(buf);
  } catch (err) {
    next(err);
  }
};


const getExamNames = async (req, res) => {
  try {
    const userId = req.user.id;               // viene del JWT middleware
    const names = await Audit.getExamNamesByUser(userId);
    return res.json(names);                  // => ["Examen A","Examen B",…]
  } catch (err) {
    console.error('Error en getExamNames:', err);
    return res.status(500).json({ message: 'Error fetching exam names' });
  }
};

 const createUserEvent = async (req, res) => {
  try {
    const userId = req.user.id;      
    const { type } = req.body;      
    const newEvent = await Audit.sendUserEvent({ userId, type });
    // newEvent tendrá { id, user_id, event_type, occurred_at }
    return res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error al crear UserEvent:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const sendWarningEmailToUser = async (req, res) => {

  const { email, username, examName, sessionId, numAlerts } = req.body;

  if (!email || !username || !examName || !sessionId || !numAlerts) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // 2. Configuramos el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Definimos las opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Advertencia: múltiples alertas detectadas',
      text: `Hola ${username},

Se ha detectado un número elevado de alertas durante tu sesión de examen "${examName}".

Detalles de la sesión:
  • ID de sesión: ${sessionId}
  • Número de alertas: ${numAlerts}

Por favor, revisa las condiciones de tu examen y asegúrate de cumplir con los requisitos.

Un saludo,
El equipo de monitoreo de exámenes
`,
    };

    
    await transporter.sendMail(mailOptions);

  
    return res
      .status(200)
      .json({ message: 'Correo de advertencia enviado correctamente.' });

  } catch (error) {
    console.error('Error enviando correo de advertencia:', error);
    return res
      .status(500)
      .json({ error: 'Error interno: no se pudo enviar el correo.' });
  }

};







module.exports = {
  logAlert,
  createExamSession,
  getAllByUser,
  getExamNames,
  getAlertsPaginated,
  getFrame,
  createUserEvent,
  sendWarningEmailToUser

};