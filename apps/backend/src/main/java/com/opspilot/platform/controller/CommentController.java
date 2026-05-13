package com.opspilot.platform.controller;

import com.opspilot.platform.dto.CommentResponse;
import com.opspilot.platform.dto.CreateCommentRequest;
import com.opspilot.platform.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/incidents/{incidentId}/comments")
    public CommentResponse addIncidentComment(@PathVariable Long incidentId,
                                              @Valid @RequestBody CreateCommentRequest request,
                                              Authentication authentication) {
        return commentService.addIncidentComment(incidentId, request, authentication.getName());
    }

    @GetMapping("/incidents/{incidentId}/comments")
    public List<CommentResponse> getIncidentComments(@PathVariable Long incidentId,
                                                     Authentication authentication) {
        return commentService.getIncidentComments(incidentId, authentication.getName());
    }

    @PostMapping("/tasks/{taskId}/comments")
    public CommentResponse addTaskComment(@PathVariable Long taskId,
                                          @Valid @RequestBody CreateCommentRequest request,
                                          Authentication authentication) {
        return commentService.addTaskComment(taskId, request, authentication.getName());
    }

    @GetMapping("/tasks/{taskId}/comments")
    public List<CommentResponse> getTaskComments(@PathVariable Long taskId,
                                                 Authentication authentication) {
        return commentService.getTaskComments(taskId, authentication.getName());
    }
}