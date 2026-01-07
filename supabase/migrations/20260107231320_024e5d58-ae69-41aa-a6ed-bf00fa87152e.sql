-- Add payment columns to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_transaction_id text,
ADD COLUMN IF NOT EXISTS calendar_event_id text;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON public.reservations(payment_status);

-- Add comments
COMMENT ON COLUMN public.reservations.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.reservations.payment_method IS 'Payment method used';
COMMENT ON COLUMN public.reservations.payment_transaction_id IS 'External payment transaction ID';
COMMENT ON COLUMN public.reservations.calendar_event_id IS 'Associated calendar event ID';