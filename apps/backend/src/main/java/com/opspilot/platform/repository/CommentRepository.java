package com.opspilot.platform.repository;

import com.opspilot.platform.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, Long entityId);

    void deleteByAuthorEmailIgnoreCase(String authorEmail);

    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
}