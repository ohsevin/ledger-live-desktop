// @flow
import React, { useCallback, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ConnectionTester from "./ConnectionTester";
import Button from "~/renderer/components/Button";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import { useMachine } from "@xstate/react";
import USBTroubleshootingMachine from "./USBTroubleshootingMachine";
import ArrowRightIcon from "~/renderer/icons/ArrowRight";
import RepairFunnel from "./solutions/RepairFunnel";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";
import { useHistory, useLocation } from "react-router-dom";
import { setUSBTroubleshootingIndex } from "~/renderer/actions/settings";

const Wrapper: ThemedComponent<{}> = styled.div`
  position: relative;
  height: 100%;
`;

const StepWrapper = styled(Box).attrs({
  horizontal: true,
  justifyContent: "space-between",
  mt: 32,
})`
  position: absolute;
  bottom: 32px;
  width: 100%;
`;

const USBTroubleshooting = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { state: locationState } = useLocation();

  // Maybe extract an index from the state
  const { USBTroubleshootingIndex } = locationState || {};
  const [state, sendEvent] = useMachine(USBTroubleshootingMachine, {
    context: { currentIndex: USBTroubleshootingIndex },
  });
  const { context } = state || {};
  const { currentIndex, solutions, SolutionComponent, platform, done } = context;

  const platformSolutions = solutions[platform];
  const isLastStep = useMemo(() => SolutionComponent === RepairFunnel, [SolutionComponent]);

  useEffect(() => {
    dispatch(setUSBTroubleshootingIndex(currentIndex));
  }, [currentIndex, dispatch]);

  // Nb reset the index if we navigate away
  useEffect(() => () => dispatch(setUSBTroubleshootingIndex()), [dispatch]);

  const onExit = useCallback(() => {
    dispatch(setUSBTroubleshootingIndex());
    history.push({ pathname: "/" });
  }, [dispatch, history]);

  return (
    <Wrapper>
      <SolutionComponent number={currentIndex + 1} sendEvent={sendEvent} done={done} />
      {!isLastStep && <ConnectionTester onExit={onExit} />}
      {!done && (
        <StepWrapper>
          <Button
            disabled={!currentIndex}
            onClick={() => sendEvent("PREVIOUS")}
            id="USBTroubleshooting-previous"
          >
            <ArrowRightIcon flipped size={16} />
            <Text ml={1}>{t("connectTroubleshooting.previousSolution")}</Text>
          </Button>
          {!isLastStep && (
            <Button
              disabled={currentIndex === platformSolutions.length - 1}
              onClick={() => sendEvent("NEXT")}
              id="USBTroubleshooting-next"
            >
              <Text mr={1}>{t("connectTroubleshooting.nextSolution")}</Text>
              <ArrowRightIcon size={16} />
            </Button>
          )}
        </StepWrapper>
      )}
    </Wrapper>
  );
};

export default USBTroubleshooting;