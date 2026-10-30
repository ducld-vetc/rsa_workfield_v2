import React from 'react';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsLabel,
  DlsSelectField,
  DlsSheetHeader,
  DlsTextField,
} from '@dls/components';
import { WORKSHOP_OPTIONS } from '../data/workshops';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

interface AcceptOdoSheetProps {
  open: boolean;
  initialOdo?: string;
  onClose: () => void;
  onConfirm: (odoKm: string) => void;
}

export const AcceptOdoSheet: React.FC<AcceptOdoSheetProps> = ({
  open,
  initialOdo = '',
  onClose,
  onConfirm,
}) => {
  const [odo, setOdo] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setOdo(digitsOnly(initialOdo));
    setError('');
  }, [open, initialOdo]);

  if (!open) return null;

  const submit = () => {
    const value = digitsOnly(odo);
    if (!value) {
      setError('Nhập ODO bắt đầu.');
      return;
    }
    onConfirm(value);
  };

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Nhập ODO bắt đầu" onClick={onClose}>
      <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
        <DlsSheetHeader title="Nhập ODO bắt đầu" onClose={onClose} />
        <div className="dls-sheet-body dls-sheet-body--form">
          <DlsTextField
            label="ODO bắt đầu (km)"
            value={odo}
            onChange={(value) => {
              setOdo(digitsOnly(value));
              if (error) setError('');
            }}
            placeholder="Nhập số công tơ mét"
            required
            error={error}
          />
        </div>
        <div className="dls-sheet-footer dls-sheet-footer--single">
          <DlsBrandButton onClick={submit}>Nhận đơn</DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export interface CompleteRescueInput {
  endOdoKm: string;
  returnToWorkshop: boolean;
  workshopName?: string;
}

interface CompleteRescueSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: CompleteRescueInput) => void;
}

export const CompleteRescueSheet: React.FC<CompleteRescueSheetProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [odo, setOdo] = React.useState('');
  const [odoError, setOdoError] = React.useState('');
  const [towChoice, setTowChoice] = React.useState<'yes' | 'no' | null>(null);
  const [choiceError, setChoiceError] = React.useState('');
  const [workshop, setWorkshop] = React.useState('');
  const [workshopError, setWorkshopError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setOdo('');
    setOdoError('');
    setTowChoice(null);
    setChoiceError('');
    setWorkshop('');
    setWorkshopError('');
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const value = digitsOnly(odo);
    const nextOdoError = value ? '' : 'Nhập ODO khi kết thúc.';
    const nextChoiceError = towChoice ? '' : 'Chọn có kéo xe về xưởng hay không.';
    const nextWorkshopError = towChoice === 'yes' && !workshop ? 'Chọn xưởng.' : '';
    setOdoError(nextOdoError);
    setChoiceError(nextChoiceError);
    setWorkshopError(nextWorkshopError);
    if (nextOdoError || nextChoiceError || nextWorkshopError) return;
    onConfirm({
      endOdoKm: value,
      returnToWorkshop: towChoice === 'yes',
      workshopName: towChoice === 'yes' ? workshop : undefined,
    });
  };

  return (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      aria-label="Hoàn thành cứu hộ"
      onClick={onClose}
    >
      <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
        <DlsSheetHeader title="Hoàn thành cứu hộ" onClose={onClose} />
        <div className="dls-sheet-body dls-sheet-body--form">
          <DlsTextField
            label="ODO khi kết thúc (km)"
            value={odo}
            onChange={(value) => {
              setOdo(digitsOnly(value));
              if (odoError) setOdoError('');
            }}
            placeholder="Nhập số công tơ mét"
            required
            error={odoError}
          />
          <div className="dls-field">
            <DlsLabel required>Có kéo xe về xưởng không?</DlsLabel>
            <div className="req-form__kind" role="radiogroup" aria-label="Có kéo xe về xưởng không">
              {(
                [
                  ['yes', 'Có'],
                  ['no', 'Không'],
                ] as const
              ).map(([value, label]) => {
                const on = towChoice === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`req-form__kind-btn${on ? ' req-form__kind-btn--on' : ''}`}
                    onClick={() => {
                      setTowChoice(value);
                      setChoiceError('');
                      if (value === 'no') {
                        setWorkshop('');
                        setWorkshopError('');
                      }
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {choiceError && (
              <p className="dls-field-error" role="alert">
                {choiceError}
              </p>
            )}
          </div>
          {towChoice === 'yes' && (
            <div>
              <DlsSelectField
                label="Xưởng"
                value={workshop}
                options={WORKSHOP_OPTIONS}
                onChange={(value) => {
                  setWorkshop(value);
                  setWorkshopError('');
                }}
                placeholder="Chọn xưởng"
                sheetTitle="Chọn xưởng"
                searchable
                searchPlaceholder="Tìm xưởng"
                required
              />
              {workshopError && (
                <p className="dls-field-error" role="alert">
                  {workshopError}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="dls-sheet-footer dls-sheet-footer--single">
          <DlsBrandButton onClick={submit}>Hoàn thành</DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};
