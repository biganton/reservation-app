import { RadioGroup, FormControlLabel, Radio } from '@mui/material';

function ChooseTableType() {
  const [tableType, setTableType] = useState('');

  return (
    <RadioGroup
      value={tableType}
      onChange={(e) => setTableType(e.target.value)}
    >
      {['Window', 'Basement', 'Terrace', 'Basic'].map((type) => (
        <FormControlLabel value={type} control={<Radio />} label={type} key={type} />
      ))}
      <Button variant="contained">Next</Button>
    </RadioGroup>
  );
}


export default ChooseTableType;