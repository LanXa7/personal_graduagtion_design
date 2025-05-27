CREATE TABLE dict_type
(
    "id"        BIGSERIAL PRIMARY KEY,
    "code"      VARCHAR(60) NOT NULL,
    creator     BIGINT      NOT NULL DEFAULT 1,
    modifier    BIGINT,
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP,
    CONSTRAINT uk_dict_type_unique UNIQUE (code)
);