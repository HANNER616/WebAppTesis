// controller/authController.js

const Audit = require('../models/auditModel'); // Asegúrate de que la ruta sea correcta


const logAlert = async (req, res) => {

    const { email, alertId, type, description, frame } = req.body;

    try {

        const auditLog = await Audit.logAlert({
            email,
            alertId,
            type,
            description,
            frame
        });

        return res.status(201).json({ message: 'Alert logged successfully', auditLog });
        
    } catch (error) {

        console.error('Error logging alert:', error);
        return res.status(500).json({ message: 'Error logging alert' });
        
    }
};


const getByDateRange = async (req, res, next) => {
  try {
    const userId    = req.user.id;                // viene del middleware
    const { startDate, endDate } = req.query;
    console.log(
      '🔍 getByDateRange for userId=',
      userId, 'from', startDate, 'to', endDate
    );
    const audits = await Audit.getByDateRangeByUser(
      userId, startDate, endDate
    );
    console.log('📨 returning audits:', audits);
    return res.status(200).json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return res.status(500).json({ message: 'Error fetching audits' });
  }
};


const getFrame = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const userId     = req.user.id;
    const dataURL    = await Audit.getFrameById(id, userId);

    //console.log(`🔍 getFrame id=${id} userId=${userId} ➞ dataURL:`, dataURL?.slice(0,50));

    if (!dataURL) {
      return res.sendStatus(404);
    }

    // separa el mime y el base64
    const [meta, b64] = dataURL.split(',');
    const m           = meta.match(/^data:(image\/\w+);base64$/);
    if (!m) {
      return res.status(500).send('Formato de Data-URL inválido');
    }
    const mime    = m[1];
    const buf     = Buffer.from(b64, 'base64');

    res.set('Content-Type', mime);
    res.send(buf);
  } catch (err) {
    next(err);
  }
};







module.exports = {
    logAlert,
    getByDateRange,
    getFrame
    
};