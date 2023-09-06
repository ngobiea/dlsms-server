import Assignment from '../../../model/assignment.js';

export async function createAssignment(req, res, _next) {
  try {
    // Extract the data from the request body
    const { title, instruction, points, dueDate, dueTime, classroomId } =
      req.body;

    // Create a new assignment object
    const assignment = new Assignment({
      title,
      instruction,
      dueDate,
      dueTime,
      points,
      classroom: classroomId,
      files: req.files.map((file) => ({
        name: file.originalname,
        type: file.mimetype,
        // Use file.location for S3 uploaded files
        path: file.location,
        size: file.size,
        mimetype: file.mimetype,
      })),
    });

    // Save the assignment to the database
    await assignment.save();

    // Send a success response
    res.status(201).json({ message: 'Assignment created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred' });
  }
}
