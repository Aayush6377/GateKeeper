package in.gatekeeper.analytics.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "route_aggregates_hourly")
@CompoundIndex(
        def = "{ 'organizationId': 1, 'routeId': 1, 'hourBucket': -1 }",
        unique = true,
        name = "org_route_hour_idx"
)
public class RouteAggregateDocument {

    @MongoId(FieldType.OBJECT_ID)
    private ObjectId id;

    private String organizationId;
    private String routeId;
    private String routeName;

    private Instant hourBucket;

    @Builder.Default
    private long totalRequests = 0;

    @Builder.Default
    private long successCount = 0;

    @Builder.Default
    private long errorCount = 0;

    @Builder.Default
    private double avgLatencyMs = 0.0;

    @Indexed(expireAfter = "2592000s")
    @Builder.Default
    private Instant timestamp = Instant.now();
}
