CREATE TABLE stall
(
    "id"           BIGSERIAL PRIMARY KEY,
    "name"         VARCHAR(60) NOT NULL,
    director_name  VARCHAR(60) NOT NULL,
    director_phone VARCHAR(11) NOT NULL,
    user_id        BIGINT,
    canteen_id     BIGINT      NOT NULL,
    creator        BIGINT      NOT NULL DEFAULT 1,
    modifier       BIGINT,
    create_time    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time    TIMESTAMP,
    CONSTRAINT fk_stall_user__user FOREIGN KEY (user_id) REFERENCES "user" (id),
    CONSTRAINT fk_stall_canteen__canteen FOREIGN KEY (canteen_id) REFERENCES canteen (id)
);