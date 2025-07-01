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


const getByDateRange = async (req, res) => {

    const {email, startDate, endDate} = req.query;
    try {
        const audits = await Audit.getByDateRange(email, startDate, endDate);
        return res.status(200).json(audits);
    } catch (error) {
        console.error('Error fetching audits:', error);
        return res.status(500).json({ message: 'Error fetching audits' });
    }
    
}


const getFrame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataURL = await Audit.getFrameById(id);
    if (!dataURL) return res.status(404).send('Not found');

    const [meta, b64] = dataURL.split(',');
    const mime = meta.match(/^data:(image\/\w+);base64$/)[1];
    const imgBuffer = Buffer.from(b64, 'base64');

    res.set('Content-Type', mime);
    res.send(imgBuffer);
  } catch (err) {
    next(err);
  }
};







module.exports = {
    logAlert,
    getByDateRange,
    getFrame
    
};