// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useModal } from 'contexts/Modal';
import { useBalances } from 'contexts/Balances';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Warning } from 'library/Form/Warning';
import { useStaking } from 'contexts/Staking';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { BondOptions } from 'contexts/Balances/types';
import { planckBnToUnit, unitToPlanckBn } from 'Utils';
import { Separator, NotesWrapper } from '../../Wrappers';
import { FormFooter } from './FormFooter';

export const UnbondAll = (props: any) => {
  const { setSection } = props;

  const { api, network, consts } = useApi();
  const { units } = network;
  const { setStatus: setModalStatus, setResize, config } = useModal();
  const { activeAccount, accountHasSigner } = useConnect();
  const { getControllerNotImported } = useStaking();
  const { getBondOptions, getBondedAccount, getAccountNominations } =
    useBalances();
  const { bondType } = config;
  const { getPoolBondOptions } = useActivePool();
  const controller = getBondedAccount(activeAccount);
  const nominations = getAccountNominations(activeAccount);
  const controllerNotImported = getControllerNotImported(controller);
  const stakeBondOptions: BondOptions = getBondOptions(activeAccount);
  const poolBondOptions = getPoolBondOptions(activeAccount);
  const { bondDuration } = consts;
  const isStaking = bondType === 'stake';
  const isPooling = bondType === 'pool';

  const { freeToUnbond: freeToUnbondBn } = isPooling
    ? poolBondOptions
    : stakeBondOptions;

  // conver BN values to number
  const freeToUnbond = planckBnToUnit(freeToUnbondBn, units);

  // local bond value
  const [bond, setBond] = useState({
    bond: freeToUnbond,
  });

  // bond valid
  const [bondValid, setBondValid]: any = useState(false);

  // unbond all validation
  const isValid = (() => {
    let _isValid = false;
    if (isPooling) {
      _isValid = freeToUnbond > 0;
    } else {
      _isValid =
        freeToUnbond > 0 && nominations.length === 0 && !controllerNotImported;
    }
    return _isValid;
  })();

  // update bond value on task change
  useEffect(() => {
    const _bond = freeToUnbond;
    setBond({ bond: _bond });
    setBondValid(isValid);
  }, [freeToUnbond, isValid]);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!bondValid || !api || !activeAccount) {
      return _tx;
    }

    // stake unbond: controller must be imported
    if (isStaking && controllerNotImported) {
      return _tx;
    }
    // remove decimal errors
    const bondToSubmit = unitToPlanckBn(bond.bond, units);

    // determine _tx
    if (isPooling) {
      _tx = api.tx.nominationPools.unbond(activeAccount, bondToSubmit);
    } else if (isStaking) {
      _tx = api.tx.staking.unbond(bondToSubmit);
    }
    return _tx;
  };

  const signingAccount = isPooling ? activeAccount : controller;

  const { submitTx, estimatedFee, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: signingAccount,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(0);
    },
    callbackInBlock: () => {},
  });

  const TxFee = (
    <p>Estimated Tx Fee: {estimatedFee === null ? '...' : `${estimatedFee}`}</p>
  );

  return (
    <>
      <div className="items">
        <>
          {!accountHasSigner(signingAccount) && (
            <Warning text="Your account is read only, and cannot sign transactions." />
          )}
          {isStaking && controllerNotImported ? (
            <Warning text="You must have your controller account imported to unbond." />
          ) : (
            <></>
          )}
          {isStaking && nominations.length ? (
            <Warning text="Stop nominating before unbonding all funds." />
          ) : (
            <></>
          )}
          <h4>Amount to unbond:</h4>
          <h2>
            {freeToUnbond} {network.unit}
          </h2>
          <Separator />
          <NotesWrapper>
            <p>
              Once unbonding, you must wait {bondDuration} eras for your funds
              to become available.
            </p>
            {bondValid && TxFee}
          </NotesWrapper>
        </>
      </div>
      <FormFooter
        setSection={setSection}
        submitTx={submitTx}
        submitting={submitting}
        isValid={bondValid && accountHasSigner(signingAccount)}
      />
    </>
  );
};
