CREATE TABLE canteen
(
    "id"           BIGSERIAL PRIMARY KEY,
    "name"         VARCHAR(60)  NOT NULL,
    director_name  VARCHAR(60)  NOT NULL,
    director_phone VARCHAR(11)  NOT NULL,
    address        VARCHAR(255) NOT NULL,
    user_id        BIGINT,
    creator        BIGINT       NOT NULL DEFAULT 1,
    modifier       BIGINT,
    create_time    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time    TIMESTAMP,
    CONSTRAINT fk_canteen_user__user FOREIGN KEY (user_id) REFERENCES "user" (id)
);