import styled from 'styled-components'
import { Button } from 'rebass'
import colors from '../ui/colors'

export default styled(Button)`
  background-color: ${colors.darkPink};
  box-shadow: 0 2px 4px 0 ${colors.darkPink};
  transition: 0.2s all;
  height: ${props => props.height || '35px'};
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${colors.darkerPink};
  }

  &:active {
    background-color: ${colors.darkerPink};
    box-shadow: 0 0px 0px 0 ${colors.darkerPink};
    transform: scale(0.95);
  }

  @media only screen and (max-width: 500px) {
    padding: 0px 5px;
    font-size: 12px;
  }
`
