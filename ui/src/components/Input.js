import styled from 'styled-components'
import colors from '../ui/colors'

export default styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${colors.sienna};

  &:focus {
    border: 2px solid ${colors.sienna};
    outline: none;
  }
`
