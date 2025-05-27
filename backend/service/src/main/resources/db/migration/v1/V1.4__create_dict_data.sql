CREATE TABLE dict_data
(
    "id"        BIGSERIAL PRIMARY KEY,
    "label"     VARCHAR(60) NOT NULL,
    "value"     INT         NOT NULL,
    type_id     BIGINT      NOT NULL,
    creator     BIGINT      NOT NULL DEFAULT 1,
    modifier    BIGINT,
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modify_time TIMESTAMP,
    CONSTRAINT uk_dict_data_unique UNIQUE (type_id, value),
    CONSTRAINT fk_dict_data_type__type FOREIGN KEY (type_id) REFERENCES dict_type (id)
);