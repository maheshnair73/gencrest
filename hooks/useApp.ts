import { useModal } from '../contexts/ModalContext';
import { useLoader } from '../contexts/LoaderContext';

export const useApp = () => {
  const modal = useModal();
  const loader = useLoader();

  return {
    ...modal,
    ...loader
  };
};
