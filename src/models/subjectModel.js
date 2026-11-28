const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    teacher: {
        type: String,
    },
})

const SubjectSchema = mongoose.model('Subject', subjectSchema);

module.exports = SubjectSchema;