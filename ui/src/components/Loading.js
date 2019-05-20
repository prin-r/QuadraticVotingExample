import React from 'react'
import styled, { keyframes } from 'styled-components'

const Anim = keyframes`
0% {
    top: calc(50% - 4px);
    left: calc(50% - 4px);
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: -1px;
    left: -1px;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    opacity: 0;
  }
`

const LoadingStyle = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => props.size || '64px'};
  height: ${props => props.size || '64px'};

  div {
    position: absolute;
    border: 4px solid ${props => props.color || 'white'};
    opacity: 1;
    border-radius: 50%;
    animation: ${Anim} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  div:nth-child(2) {
    animation-delay: -0.5s;
  }
`

export default ({ color, size }) => (
  <LoadingStyle color={color} size={size}>
    <div />
    <div />
  </LoadingStyle>
)
