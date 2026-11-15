CREATE DATABASE IF NOT EXISTS banco_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS banco_academico_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'banco_app'@'%' IDENTIFIED BY 'BancoCeiba123!';
GRANT ALL PRIVILEGES ON banco_academico.* TO 'banco_app'@'%';
GRANT ALL PRIVILEGES ON banco_academico_test.* TO 'banco_app'@'%';
FLUSH PRIVILEGES;