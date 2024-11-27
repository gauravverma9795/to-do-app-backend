const mongoose = require("mongoose");
const User = require("../models/User")
const Task = require("../models/Task")

exports.createTask = async (req, res) => {
    try {
        const { title, description, duedate, userId } = req.body;

        // Check if required fields are provided
        if (!title || !description || !duedate ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required  are required"
            });
        }

        const newTask = await Task.create({
            title,
            description,
            duedate
        });

        // Find the user by author ID and add the blog to their blogs array
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Author not found",
            });
        }

        user.tasks.push(newTask._id);
        await user.save();


        return res.status(200).json({
            success: true,
            message: "Task created successfully",
            data: newTask,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.getTask = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user by ID and populate their tasks
        const user = await User.findById(userId).populate('tasks');

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Return the user's tasks
        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: user.tasks,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




exports.editTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, duedate, status, userId } = req.body;

        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (duedate) updates.duedate = duedate;
        if (status) updates.status = status;

        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (!user.tasks.includes(taskId)) {
                user.tasks.push(taskId);
                await user.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.deleteTask = async (req, res) => {
    try {
        const { taskId, userId } = req.params;

        
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        // Find the task by ID and delete it
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (userId) {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            user.tasks = user.tasks.filter(task => task.toString() !== taskId);
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
