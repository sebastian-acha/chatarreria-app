ALTER TABLE transacciones
ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'anulada'));
