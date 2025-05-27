CREATE TABLE order_item
(
    "id"          BIGSERIAL PRIMARY KEY,
    "total_price" DECIMAL(10, 2) NOT NULL,
    total_number  INT            NOT NULL,
    food_id       BIGINT         NOT NULL,
    order_id      BIGINT         NOT NULL,
    modifier      BIGINT,
    create_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time   TIMESTAMP,
    CONSTRAINT uk_order_item_unique UNIQUE (order_id, food_id),
    CONSTRAINT fk_order_item_order__order FOREIGN KEY (order_id) REFERENCES "order" (id),
    CONSTRAINT fk_order_food__food FOREIGN KEY (food_id) REFERENCES food (id)
);