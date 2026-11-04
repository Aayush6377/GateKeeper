package in.gatekeeper.management.service.audit;

import in.gatekeeper.management.entity.AuditRecord;
import in.gatekeeper.management.repository.AuditRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditPersistenceService {
    private final AuditRecordRepository recordRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public void saveSuccess(AuditRecord record){
        recordRepository.save(record);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveFailure(AuditRecord record){
        recordRepository.save(record);
    }
}
