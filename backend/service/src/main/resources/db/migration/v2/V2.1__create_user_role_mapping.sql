CREATE TABLE user_role_mapping
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_mapping__user FOREIGN KEY (user_id) REFERENCES "user" (id),
    CONSTRAINT fk_user_role_mapping__role FOREIGN KEY (role_id) REFERENCES role (id)
);