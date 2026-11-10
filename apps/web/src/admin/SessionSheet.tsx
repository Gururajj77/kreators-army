// Owner: A4 Admin. The session sheet (admin brief 5.8): when any call answers 401 `expired` or `locked` while the admin is open, this modal asks for the
// passkey over the current screen. On success every waiting call is sent again and the drawer's values and the import's progress stay as they were.
// "Lock" or Esc goes to the lock screen instead.
import type { AdminSession } from '@kreators/shared';
import { useId } from 'react';
import { settleUnlock, useAdminUi } from './api';
import { Modal } from './bits';
import { PasskeyForm } from './LockScreen';

export function SessionSheet({ onUnlocked, onLock }: { onUnlocked: (session: AdminSession) => void; onLock: () => void }) {
  const open = useAdminUi((s) => s.sheet);
  const id = useId();
  if (!open) return null;
  const lock = () => {
    settleUnlock(false);
    onLock();
  };
  return (
    <Modal onClose={lock} labelledBy={id} className="adm-sheet" backdropCloses={false}>
      <div className="adm-sheet-in">
        <h2 id={id} className="adm-sheet-title">
          Your session ended.
        </h2>
        <p className="adm-sheet-lead">Enter the passkey to carry on.</p>
        <PasskeyForm
          onUnlocked={(session) => {
            onUnlocked(session);
            settleUnlock(true);
          }}
        />
        <button type="button" className="btn btn-sm btn-ghost adm-sheet-lock" onClick={lock}>
          Lock
        </button>
      </div>
    </Modal>
  );
}
