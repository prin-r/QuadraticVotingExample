import styled from 'styled-components'

const Image = styled.div`
  background: url(${props => props.image});
  height: ${props => props.height}px;
  width: ${props =>
    props.width + (typeof props.width === 'number' ? 'px' : '')};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  ${props => props.position && 'position:' + props.position};
  ${props => props.circle && 'border-radius: 50%'};
`

export default Image
