-- LifeLink Seed Data: Bengaluru Metropolitan Service Area Localities
INSERT INTO public.locality_records (name, city, state, pincode, zone, latitude, longitude, is_active) VALUES
('Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'East', 12.9784, 77.6408, TRUE),
('Koramangala', 'Bengaluru', 'Karnataka', '560034', 'South', 12.9352, 77.6245, TRUE),
('Whitefield', 'Bengaluru', 'Karnataka', '560066', 'East', 12.9698, 77.7500, TRUE),
('Jayanagar', 'Bengaluru', 'Karnataka', '560041', 'South', 12.9308, 77.5838, TRUE),
('HSR Layout', 'Bengaluru', 'Karnataka', '560102', 'South', 12.9121, 77.6446, TRUE),
('Malleshwaram', 'Bengaluru', 'Karnataka', '560003', 'North', 13.0031, 77.5643, TRUE),
('Rajajinagar', 'Bengaluru', 'Karnataka', '560010', 'West', 12.9982, 77.5530, TRUE),
('Electronic City', 'Bengaluru', 'Karnataka', '560100', 'South', 12.8452, 77.6602, TRUE),
('BTM Layout', 'Bengaluru', 'Karnataka', '560076', 'South', 12.9166, 77.6101, TRUE),
('Hebbal', 'Bengaluru', 'Karnataka', '560024', 'North', 13.0358, 77.5970, TRUE),
('Yelahanka', 'Bengaluru', 'Karnataka', '560064', 'North', 13.1007, 77.5963, TRUE),
('Banashankari', 'Bengaluru', 'Karnataka', '560050', 'South', 12.9255, 77.5468, TRUE),
('Marathahalli', 'Bengaluru', 'Karnataka', '560037', 'East', 12.9591, 77.6974, TRUE),
('Basavanagudi', 'Bengaluru', 'Karnataka', '560004', 'South', 12.9416, 77.5755, TRUE),
('Shivajinagar / Central', 'Bengaluru', 'Karnataka', '560051', 'Central', 12.9857, 77.6057, TRUE),
('Kalyan Nagar / HRBR', 'Bengaluru', 'Karnataka', '560043', 'East', 13.0163, 77.6432, TRUE),
('Yeshwanthpur', 'Bengaluru', 'Karnataka', '560022', 'North', 13.0284, 77.5407, TRUE),
('Bellandur', 'Bengaluru', 'Karnataka', '560103', 'East', 12.9260, 77.6762, TRUE)
ON CONFLICT DO NOTHING;
