import colors from '../ui/colors'
import styled from 'styled-components'
import { Flex } from 'rebass'

export default styled(Flex).attrs({
  my: '20px',
  p: '20px',
  bg: colors.tan,
})`
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 ${colors.oliveBrown};
  transition: 0.5s all;
  flex-direction: ${props => props.flexDirection || 'column'};

  &:hover {
    box-shadow: 0 5px 7px 0 ${colors.oliveGreen};
    transform: scale(1.005);
  }

  @media only screen and (max-width: 750px) {
    flex-direction: column;
  }
`
