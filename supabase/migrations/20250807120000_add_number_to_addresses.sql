-- Adicionar campo number na tabela addresses
ALTER TABLE public.addresses 
ADD COLUMN number VARCHAR(10);

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.addresses.number IS 'House number, apartment number, or unit number';

-- Criar índice para melhor performance em consultas
CREATE INDEX idx_addresses_number ON public.addresses(number);