import { EncryptionPassword } from "encryption";
import React, { createContext, useContext, useMemo, useReducer } from "react";
import { actionClearEvent } from "_app";

import { ActionType } from "./actions";

interface ContextType {
    state: State;
    dispatch: React.Dispatch<Action>;
}

type State = {
    encryptionPassword: EncryptionPassword;
    event: {
        type: ActionType | null;
        payload: any;
    };
    passwordModal: {
        isOpen: boolean;
        resolver: ((success: boolean) => void) | null;
        newPasswordIsInvalidForCurrentRound: boolean;
    };
    ualSoftkeyModal: {
        isOpen: boolean;
        resolver: ((value: unknown) => void) | null; // TODO: What value should be passed in (if any)?
    };
};

type Action = { type: ActionType; payload: any };

const initialState: State = {
    encryptionPassword: {},
    event: { type: null, payload: null },
    passwordModal: {
        isOpen: false,
        resolver: null,
        newPasswordIsInvalidForCurrentRound: false,
    },
    ualSoftkeyModal: {
        isOpen: false,
        resolver: null,
    },
};
const store = createContext<ContextType | null>(null);
const { Provider } = store;

const reducer = (state: State, action: Action): State => {
    const { type, payload } = action;
    switch (type) {
        case ActionType.SetEncryptionPassword:
            return {
                ...state,
                encryptionPassword: payload,
            };
        case ActionType.ShowPasswordModal:
            return { ...state, passwordModal: payload };
        case ActionType.ShowUALSoftkeyModal:
            return { ...state, ualSoftkeyModal: payload };
        case ActionType.EventDidTapMobileAppHeader:
            return { ...state, event: action };
        case ActionType.EventClear:
            return { ...state, event: { type: null, payload: null } };
        default:
            return state;
    }
};

const StateProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // ensure unrelated <WebApp /> rerenders of provider do not cause consumers to rerender
    // https://hswolff.com/blog/how-to-usecontext-with-usereducer/#performance-concerns
    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return <Provider value={contextValue}>{children}</Provider>;
};

export const Store = { store, StateProvider };

export const useGlobalStore = () => {
    const globalStore = useContext(Store.store);
    if (!globalStore) throw new Error("hook should be within store provider");
    return globalStore;
};

export const useReduxEvent = (type: ActionType, effect: () => void) => {
    const { dispatch, state } = useGlobalStore();
    if (state.event.type !== type) return;
    effect();
    dispatch(actionClearEvent());
};
