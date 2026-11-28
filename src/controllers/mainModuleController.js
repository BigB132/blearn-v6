const express = require('express')
const mainModuleRouter = express.Router();

const { authenticate } = require('../controllers/authController')

const Subject = require('../models/subjectModel');
const { z } = require('zod');

const subjectSchema = z.object({
    name: z.string().min(1, "The name of your subject should consist of atleast one character.").max(16, "Your subject name shouldn't exceed 16 characters."),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Please enter a valid hex color."),
    teacher: z.string().min(1, "The name of your teacher should consist of atleast one character.").max(16, "Your teachers name shouldn't exceed 16 characters.").optional().or(z.literal("")),
})

const subjectEditSchema = z.object({
    subjectId: z.string().max(32, "Like genuinly what are you even trying"),
    name: z.string().min(1, "The name of your subject should consist of atleast one character.").max(16, "Your subject name shouldn't exceed 16 characters."),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Please enter a valid hex color."),
    teacher: z.string().min(1, "The name of your teacher should consist of atleast one character.").max(16, "Your teachers name shouldn't exceed 16 characters.").optional().or(z.literal("")),
})

const subjectDeleteSchema = z.object({
    subjectId: z.string().max(32, "Like genuinly what are you even trying"),
});

mainModuleRouter.get('/subjects', authenticate, async (req, res) => {

    const subjects = await Subject.find({ userId: req.userId });
    if (subjects) {
        return res.status(200).json(subjects);
    } else {
        return res.status(400).json({error: "Failed fetching subjects from db"});
    };

})

mainModuleRouter.post('/subjects', authenticate, async (req, res) => {

    console.log(req.body);

    const parsed = subjectSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: parsed.error.flatten().fieldErrors
        })
    }

    const { name, color, teacher } = parsed.data;

    try {
        const newSubjects = new Subject({
            userId: req.userId,
            name,
            color,
            teacher,
        })

        await newSubjects.save();

        return res.status(200).json({ state: "success" })
    } catch (err) {
        console.log("Error while adding subject:", err);
        res.status(500).json({ error: 'Internal server error' })
    }
})

mainModuleRouter.put('/subjects', authenticate, async (req, res) => {

    const parsed = subjectEditSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: parsed.error.flatten().fieldErrors
        })
    }

    const { subjectId, name, color, teacher } = parsed.data;


    try {
        const subject = await Subject.findById(subjectId);

        subject.name = name;
        subject.color = color;
        subject.teacher = teacher;

        await subject.save();

        return res.status(200).json({ state: "success" })
    } catch (err) {
        console.log("Error while editing subject:", err);
        res.status(500).json({ error: 'Internal server error' })
    }
})

mainModuleRouter.delete('/subjects', authenticate, async (req, res) => {

    const parsed = subjectDeleteSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: parsed.error.flatten().fieldErrors,
        })

    }

    const { subjectId } = parsed.data;

    try {

        await Subject.findOneAndDelete({ userId: req.userId, _id: subjectId });
        return res.status(200).json({ state: 'success' });

    } catch (err) {
        console.log('Error while deleting subjct:', err)
        res.status(500).json({ error: 'Internal server error' })
    }


})

module.exports = mainModuleRouter;