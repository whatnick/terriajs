import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  PropsWithChildren
} from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Terria from "../../../../../Models/Terria";
import ViewState from "../../../../../ReactViewModels/ViewState";

import Spacing from "../../../../../Styled/Spacing";
import { TextSpan } from "../../../../../Styled/Text";

import { buildShareLink, buildShortShareLink } from "../BuildShareLink";
import { ShareUrlClipboard } from "./ShareUrlClipboard";
import { ShareUrlWarning } from "./ShareUrlWarning";

interface IShareUrlProps {
  terria: Terria;
  viewState: ViewState;
  includeStories: boolean;
  shouldShorten: boolean;
  theme: "light" | "dark";
  inputTheme?: "light" | "dark";
  rounded?: boolean;
  callback?: () => void;
}

export interface IShareUrlRef {
  url: string;
  shorteningInProgress: boolean;
}

export const ShareUrl = forwardRef<
  IShareUrlRef,
  PropsWithChildren<IShareUrlProps>
>(
  (
    {
      terria,
      viewState,
      includeStories,
      shouldShorten,
      children,
      theme,
      inputTheme,
      rounded,
      callback
    },
    forwardRef
  ) => {
    const { t } = useTranslation();

    const [shareUrl, setShareUrl] = useState("");
    const [shorteningInProgress, setShorteningInProgress] = useState(false);
    const [placeholder, setPlaceholder] = useState<string>();

    useImperativeHandle(
      forwardRef,
      () => ({
        url: shareUrl,
        shorteningInProgress: shorteningInProgress
      }),
      [forwardRef, shareUrl, shorteningInProgress]
    );

    const buildUnshortenderUrl = (
      terria: Terria,
      viewState: ViewState,
      includeStories: boolean
    ) => {
      return buildShareLink(terria, viewState, {
        includeStories
      });
    };

    useEffect(() => {
      if (shouldShorten) {
        setPlaceholder(t("share.shortLinkShortening"));
        setShorteningInProgress(true);
        buildShortShareLink(terria, viewState, {
          includeStories
        })
          .then(shareUrl => setShareUrl(shareUrl))
          .catch(() => {
            setShareUrl(
              buildUnshortenderUrl(terria, viewState, includeStories)
            );
          })
          .finally(() => setShorteningInProgress(false));
      } else {
        setShareUrl(buildUnshortenderUrl(terria, viewState, includeStories));
      }
    }, [terria, viewState, shouldShorten, includeStories]);

    return (
      <>
        <Explanation textDark={theme === "light"}>
          {t("clipboard.shareExplanation")}
        </Explanation>
        <Spacing bottom={1} />
        <ShareUrlClipboard
          terria={terria}
          shareUrl={!shorteningInProgress ? shareUrl : ""}
          theme={theme}
          inputTheme={inputTheme}
          placeholder={placeholder}
          rounded={!!rounded}
        />
        {children}
        <Spacing bottom={2} />
        <ShareUrlWarning
          terria={terria}
          viewState={viewState}
          callback={callback || (() => {})}
        />
      </>
    );
  }
);

const Explanation = styled(TextSpan)`
  opacity: 0.8;
`;
