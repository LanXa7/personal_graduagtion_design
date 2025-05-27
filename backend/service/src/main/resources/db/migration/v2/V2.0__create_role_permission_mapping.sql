-- 角色权限中间表
CREATE TABLE role_permission_mapping
(
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_mapping__role FOREIGN KEY (role_id) REFERENCES role (id),
    CONSTRAINT fk_role_permission_mapping__permission FOREIGN KEY (permission_id) REFERENCES permission (id)
);