CREATE TABLE food
(
    "id"          BIGSERIAL PRIMARY KEY,
    "name"        VARCHAR(60)    NOT NULL,
    "code"        VARCHAR(60)    NOT NULL,
    "picture"     VARCHAR(255)    NOT NULL,
    "price"       DECIMAL(10, 2) NOT NULL,
    "description" VARCHAR(255),
    stall_id      BIGINT         NOT NULL,
    creator       BIGINT         NOT NULL DEFAULT 1,
    modifier      BIGINT,
    create_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time   TIMESTAMP,
    CONSTRAINT uk_food_unique UNIQUE (code),
    CONSTRAINT fk_food_stall__stall FOREIGN KEY (stall_id) REFERENCES stall (id)
);