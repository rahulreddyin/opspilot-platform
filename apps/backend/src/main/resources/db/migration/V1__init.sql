CREATE TABLE IF NOT EXISTS app_health_check (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_health_check (service_name, status)
VALUES ('platform-api', 'UP');