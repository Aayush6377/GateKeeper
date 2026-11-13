package in.gatekeeper.analytics.repository;

import in.gatekeeper.analytics.document.RouteAggregateDocument;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RouteAggregateRepository extends MongoRepository<RouteAggregateDocument, ObjectId> {

    Optional<RouteAggregateDocument> findByRouteIdAndHourBucket(String routeId, Instant hourBucket);

    List<RouteAggregateDocument> findAllByOrganizationId(String organizationId);

    List<RouteAggregateDocument> findAllByOrganizationIdAndHourBucketBetween(String organizationId, Instant from, Instant to);

    List<RouteAggregateDocument> findAllByHourBucketBetween(Instant from, Instant to);
}
