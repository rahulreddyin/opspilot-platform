package com.opspilot.platform.events;

public class TaskStatusUpdatedEvent {

    private Long taskId;
    private String title;
    private String status;

    public TaskStatusUpdatedEvent() {
    }

    public TaskStatusUpdatedEvent(Long taskId, String title, String status) {
        this.taskId = taskId;
        this.title = title;
        this.status = status;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}