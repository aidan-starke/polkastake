// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NumberEasing from 'che-react-number-easing';
import { OpenAssistantIcon } from 'library/OpenAssistantIcon';
import { StatPie } from 'library/Graphs/StatBoxPie';
import { StatBox } from './Item';
import { PieProps } from './types';

export const Pie = (props: PieProps) => {
  const { label, stat, graph, tooltip, assistant } = props;
  const assist = assistant !== undefined;
  const page = assistant?.page ?? '';
  const key = assistant?.key ?? '';

  const showValue = stat?.value !== 0 || stat?.total === 0;
  const showTotal = !!stat?.total;

  return (
    <StatBox>
      <div className="content chart">
        <div className="chart">
          <StatPie value={graph?.value1} value2={graph?.value2} />
          {tooltip && (
            <div className="tooltip">
              <h3>{tooltip}</h3>
            </div>
          )}
        </div>

        <div className="labels">
          <h2>
            {showValue ? (
              <>
                <NumberEasing
                  ease="quintInOut"
                  precision={2}
                  speed={250}
                  trail={false}
                  value={stat?.value}
                  useLocaleString
                />
                {stat?.unit && (
                  <>
                    &nbsp;
                    {stat?.unit}
                  </>
                )}

                {showTotal && (
                  <span className="total">
                    /{' '}
                    <NumberEasing
                      ease="quintInOut"
                      precision={2}
                      speed={250}
                      trail={false}
                      value={stat?.total}
                      useLocaleString
                    />
                    {stat?.unit && (
                      <>
                        &nbsp;
                        {stat?.unit}
                      </>
                    )}
                  </span>
                )}
              </>
            ) : (
              <>0</>
            )}
          </h2>
          <h4>
            {label}
            {assist && <OpenAssistantIcon page={page} title={key} />}
          </h4>
        </div>
      </div>
    </StatBox>
  );
};
