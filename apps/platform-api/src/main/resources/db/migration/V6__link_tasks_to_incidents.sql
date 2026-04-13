ALTER TABLE tasks
ADD COLUMN incident_id BIGINT;

ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_incident
FOREIGN KEY (incident_id) REFERENCES incidents(id);