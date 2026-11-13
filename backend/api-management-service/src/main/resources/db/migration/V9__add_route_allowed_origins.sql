CREATE TABLE route_allowed_origins (
   route_pk UUID NOT NULL,
   origin VARCHAR(255) NOT NULL,
   CONSTRAINT fk_route_allowed_origins_route FOREIGN KEY (route_pk) REFERENCES api_routes (id) ON DELETE CASCADE
);