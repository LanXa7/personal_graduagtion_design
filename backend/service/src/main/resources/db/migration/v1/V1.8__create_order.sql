CREATE TABLE "order"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "code"        VARCHAR(50)    NOT NULL,
    "total_price" DECIMAL(10, 2) NOT NULL,
    "picture"     VARCHAR(255)    NOT NULL,
    "state"       SMALLINT        NOT NULL DEFAULT 0,
    stall_id       BIGINT NOT NULL ,
    modifier      BIGINT,
    create_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time   TIMESTAMP,
    CONSTRAINT uk_order_unique UNIQUE (code),
    CONSTRAINT fk_order_stall__stall FOREIGN KEY (stall_id) REFERENCES stall
);