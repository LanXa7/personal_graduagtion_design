CREATE TABLE "user"
(
    "id"        BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL,
    phone       VARCHAR(14)  NOT NULL,
    "password"  VARCHAR(256) NOT NULL,
    email       VARCHAR(50)  NOT NULL,
    avatar      VARCHAR(255),
    modifier    BIGINT,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP,
    CONSTRAINT uk_user_unique UNIQUE (username, email)
);