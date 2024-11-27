const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth")
const{
    createTask,
    editTask,
    deleteTask,
    getTask
} = require("../controllers/Task");

router.post("/create-task",auth,createTask)

router.get("/:userId",auth,getTask)

router.put("/edit-task/:taskId",auth,editTask)

router.delete("/delete-task/:taskId/:userId",auth,deleteTask)

module.exports = router