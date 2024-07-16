import {
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import style from '../../index.css?inline';

const createElement = <T extends Element>(template: string) => {
  return new Range().createContextualFragment(template)
    .firstElementChild as unknown as T
}

export function ShadowDom({
  parentElement,
  position = 'beforebegin',
  children,
}: {
  parentElement: Element
  position?: InsertPosition
  children: React.ReactNode
}) {
  const [shadowHost] = useState(() => document.createElement('search-wise'))

  const [shadowRoot] = useState(() => shadowHost.attachShadow({ mode: 'open' }))

  useLayoutEffect(() => {
    if (parentElement) {
      parentElement.insertAdjacentElement(position, shadowHost)
    }

    return () => {
      shadowHost.remove()
    }
  }, [parentElement, shadowHost, position])

  shadowRoot.appendChild(
    createElement(`<style type="text/css">${style}</style>`)
  )

  return createPortal(children, shadowRoot)
}
