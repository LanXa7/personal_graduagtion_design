CREATE TABLE role
(
    "id"        BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL,
    creator     BIGINT      NOT NULL DEFAULT 1,
    modifier    BIGINT,
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP,
    CONSTRAINT uk_role_unique UNIQUE (code)
);