"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.getTask = getTask;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.addComment = addComment;
exports.addAttachment = addAttachment;
exports.getAttachment = getAttachment;
exports.getTaskStats = getTaskStats;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TASK_INCLUDE = {
    comments: { orderBy: { createdAt: 'asc' } },
    attachments: { select: { id: true, filename: true, filesize: true, mimetype: true, createdAt: true } },
    activities: { orderBy: { createdAt: 'desc' }, take: 20 },
};
async function getTasks(req, res) {
    const { status, location, priority, assignedTo, search } = req.query;
    const where = {};
    if (status && status !== 'All')
        where.status = status;
    if (location && location !== 'All Locations')
        where.location = location;
    if (priority && priority !== 'All')
        where.priority = priority;
    if (assignedTo)
        where.assignedTo = { contains: String(assignedTo), mode: 'insensitive' };
    if (search)
        where.taskName = { contains: String(search), mode: 'insensitive' };
    const tasks = await prisma.task.findMany({ where, include: TASK_INCLUDE, orderBy: { startDate: 'asc' } });
    res.json(tasks);
}
async function getTask(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    const task = await prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
    if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    res.json(task);
}
async function createTask(req, res) {
    const { taskName, projectName, location, department, description, assignedTo, startDate, endDate, priority, status, dependencyIds, estimatedHours, actualHours, notes, completionPct, milestone } = req.body;
    if (!taskName || !startDate || !endDate) {
        res.status(400).json({ error: 'taskName, startDate, endDate are required' });
        return;
    }
    const task = await prisma.task.create({
        data: {
            taskName: String(taskName),
            projectName: projectName ? String(projectName) : null,
            location: location ? String(location) : null,
            department: department ? String(department) : null,
            description: description ? String(description) : null,
            assignedTo: assignedTo ? String(assignedTo) : null,
            startDate: new Date(String(startDate)),
            endDate: new Date(String(endDate)),
            priority: priority ? String(priority) : 'Medium',
            status: status ? String(status) : 'Planned',
            dependencyIds: dependencyIds ? String(dependencyIds) : null,
            estimatedHours: estimatedHours ? parseFloat(String(estimatedHours)) : null,
            actualHours: actualHours ? parseFloat(String(actualHours)) : null,
            notes: notes ? String(notes) : null,
            completionPct: completionPct ? parseInt(String(completionPct)) : 0,
            milestone: milestone === true || milestone === 'true',
        },
        include: TASK_INCLUDE,
    });
    await prisma.taskActivity.create({ data: { taskId: task.id, action: 'CREATED', details: `Task "${taskName}" created` } });
    res.status(201).json(task);
}
async function updateTask(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    const fields = ['taskName', 'projectName', 'location', 'department', 'description', 'assignedTo', 'priority', 'status', 'dependencyIds', 'notes', 'completionPct', 'milestone'];
    const data = {};
    for (const f of fields) {
        if (req.body[f] !== undefined)
            data[f] = req.body[f];
    }
    if (req.body.startDate)
        data.startDate = new Date(String(req.body.startDate));
    if (req.body.endDate)
        data.endDate = new Date(String(req.body.endDate));
    if (req.body.estimatedHours !== undefined)
        data.estimatedHours = req.body.estimatedHours ? parseFloat(String(req.body.estimatedHours)) : null;
    if (req.body.actualHours !== undefined)
        data.actualHours = req.body.actualHours ? parseFloat(String(req.body.actualHours)) : null;
    if (req.body.completionPct !== undefined)
        data.completionPct = parseInt(String(req.body.completionPct));
    if (data.completionPct === 100 && !req.body.status)
        data.status = 'Completed';
    const task = await prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
    const changed = [];
    if (data.status && data.status !== existing.status)
        changed.push(`Status: ${existing.status} → ${data.status}`);
    if (data.completionPct !== undefined && data.completionPct !== existing.completionPct)
        changed.push(`Progress: ${existing.completionPct}% → ${data.completionPct}%`);
    if (data.assignedTo && data.assignedTo !== existing.assignedTo)
        changed.push(`Assigned: ${existing.assignedTo || 'none'} → ${data.assignedTo}`);
    await prisma.taskActivity.create({ data: { taskId: id, action: 'UPDATED', details: changed.length ? changed.join('; ') : 'Task updated' } });
    res.json(task);
}
async function deleteTask(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
}
async function addComment(req, res) {
    const taskId = parseInt(req.params.id);
    const { content, author } = req.body;
    if (!content) {
        res.status(400).json({ error: 'content is required' });
        return;
    }
    const comment = await prisma.taskComment.create({ data: { taskId, content: String(content), author: author ? String(author) : 'admin' } });
    await prisma.taskActivity.create({ data: { taskId, action: 'COMMENT', details: `Comment added by ${comment.author}` } });
    res.status(201).json(comment);
}
async function addAttachment(req, res) {
    const taskId = parseInt(req.params.id);
    const { filename, mimetype, data: b64 } = req.body;
    if (!filename || !b64) {
        res.status(400).json({ error: 'filename and data are required' });
        return;
    }
    const buffer = Buffer.from(String(b64), 'base64');
    const attachment = await prisma.taskAttachment.create({
        data: { taskId, filename: String(filename), mimetype: mimetype ? String(mimetype) : null, filesize: buffer.length, data: buffer },
        select: { id: true, filename: true, filesize: true, mimetype: true, createdAt: true },
    });
    res.status(201).json(attachment);
}
async function getAttachment(req, res) {
    const id = parseInt(req.params.attachId);
    const att = await prisma.taskAttachment.findUnique({ where: { id } });
    if (!att || !att.data) {
        res.status(404).json({ error: 'Attachment not found' });
        return;
    }
    res.setHeader('Content-Type', att.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${att.filename}"`);
    res.send(att.data);
}
async function getTaskStats(req, res) {
    const [total, byStatus, byLocation] = await Promise.all([
        prisma.task.count(),
        prisma.task.groupBy({ by: ['status'], _count: true }),
        prisma.task.groupBy({ by: ['location'], _count: true }),
    ]);
    const statusMap = {};
    for (const s of byStatus)
        statusMap[s.status] = s._count;
    const locationMap = {};
    for (const l of byLocation)
        locationMap[l.location || 'Unknown'] = l._count;
    const now = new Date();
    const upcoming = await prisma.task.count({ where: { endDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) }, status: { not: 'Completed' } } });
    const delayed = await prisma.task.count({ where: { endDate: { lt: now }, status: { notIn: ['Completed', 'On Hold'] } } });
    res.json({ total, byStatus: statusMap, byLocation: locationMap, upcoming, delayed });
}
