import React from 'react';
import { Modal } from './Modal';
import type { BloodGroup, DetailedBloodRequest } from '../../types/blood.types';
import { CreateEmergencyRequestWizard } from '../emergency/CreateEmergencyRequestWizard';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBloodGroup?: BloodGroup;
  initialLocalityId?: string;
  onSubmitSuccess?: (details: DetailedBloodRequest) => void;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  initialBloodGroup = 'O+',
  initialLocalityId = 'loc-1',
  onSubmitSuccess,
}) => {
  if (!isOpen) return null;

  const handleSuccess = (newRequest: DetailedBloodRequest) => {
    if (onSubmitSuccess) {
      onSubmitSuccess(newRequest);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Emergency Blood Requisition"
      description="LifeLink mobilizes registered, willing donors within your target Bengaluru locality radius."
      maxWidth="xl"
    >
      <CreateEmergencyRequestWizard
        initialBloodGroup={initialBloodGroup}
        initialLocalityId={initialLocalityId}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};
