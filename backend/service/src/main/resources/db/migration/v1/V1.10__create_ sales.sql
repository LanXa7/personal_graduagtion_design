CREATE TABLE sales
(
    "id"        BIGSERIAL PRIMARY KEY,
    "number"    INT       NOT NULL,
    food_id     BIGINT    NOT NULL,
    stall_id    BIGINT    NOT NULL,
    modifier    BIGINT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP,
    CONSTRAINT fk_sales_volume__food FOREIGN KEY (food_id) REFERENCES "food" (id),
    CONSTRAINT fk_sales_volume__stall FOREIGN KEY (stall_id) REFERENCES stall (id)
);