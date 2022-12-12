import React from "react";
import {
  MenuItem,
  TextField,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import { DatePicker, DateRangePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useWhyDidYouUpdate } from "../../hooks/useWhyDidYouUpdate";

const InputComponent = React.memo(function Input(props) {
  const {
    inputType,
    inputTitle,
    gridSize,
    inputOptions,
    currentValue,
    inputSetStateFn,
    isRequired,
    formTitle,
    userPreferences,
    dynamicAdd,
    dynamicRemove,
  } = props;

  //useWhyDidYouUpdate("Input", props);
  switch (inputType) {
    case "autocomplete":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <Autocomplete
            disablePortal
            options={inputOptions}
            value={currentValue}
            onChange={(e, newValue) => {
              inputSetStateFn(e, newValue);
            }}
            renderInput={(params) => (
              <TextField
                sx={{ width: "100%" }}
                {...params}
                required={isRequired}
                label={inputTitle}
                variant='standard'
              />
            )}
          />
        </Grid>
      );
    case "textfield":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <TextField
            label={inputTitle}
            value={currentValue}
            onChange={(e) => {
              inputSetStateFn(e.target.value);
            }}
            sx={{ width: "100%" }}
            required={isRequired}
            variant='standard'
          />
        </Grid>
      );
    case "number":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <TextField
            required={isRequired}
            min='0'
            sx={{ width: "100%" }}
            label={inputTitle}
            type='number'
            value={currentValue}
            onChange={(e) => {
              inputSetStateFn(e.target.value);
            }}
            variant='standard'
          />
        </Grid>
      );
    case "date":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={inputTitle}
              value={currentValue}
              onChange={(newValue) => {
                inputSetStateFn(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  required={isRequired}
                  variant='standard'
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
      );
    case "daterange":
      return (
        <Grid key={inputTitle[0] + inputTitle[1]} item xs={gridSize}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              startText={inputTitle[0]}
              endText={inputTitle[1]}
              value={currentValue}
              onChange={(newValue) => {
                inputSetStateFn(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <Grid
                  container
                  item
                  spacing={2}
                  justifyContent='center'
                  alignItems='stretch'
                >
                  <Grid item xs={6}>
                    <TextField
                      required={isRequired}
                      variant='standard'
                      sx={{ width: "100%" }}
                      {...startProps}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required={isRequired}
                      variant='standard'
                      sx={{ width: "100%" }}
                      {...endProps}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </LocalizationProvider>
        </Grid>
      );
    case "select":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <FormControl
            required={isRequired}
            variant='standard'
            sx={{ width: "100%" }}
          >
            <InputLabel>{inputTitle}</InputLabel>
            <Select
              value={currentValue}
              onChange={(e) => {
                inputSetStateFn(e.target.value);
              }}
              label={inputTitle}
            >
              {inputOptions.map((o) => {
                return (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      );
    case "dynamic":
      return currentValue.map((input, i) => {
        return (
          <Grid
            key={inputTitle + i}
            container
            item
            spacing={2}
            justifyContent='center'
            alignItems='stretch'
          >
            {Object.entries(input).map(([key, value]) => {
              switch (value[1].inputType) {
                case "number":
                  return (
                    <Grid
                      key={value[1].inputTitle + i}
                      item
                      xs={value[1].gridSize}
                    >
                      <TextField
                        required={isRequired}
                        min='0'
                        sx={{ width: "100%" }}
                        label={value[1].inputTitle}
                        name={key}
                        type='number'
                        value={value[0]}
                        onChange={(e) => {
                          inputSetStateFn(e.target.name, e.target.value, i);
                        }}
                        variant='standard'
                      />
                    </Grid>
                  );
                case "autocomplete":
                  if (formTitle === "Purchases")
                    return (
                      <Grid
                        key={value[1].inputTitle + i}
                        item
                        xs={value[1].gridSize}
                      >
                        <Autocomplete
                          disablePortal
                          freeSolo
                          options={value[1].inputOptions}
                          value={value[0]}
                          onChange={(e, newValue) => {
                            inputSetStateFn(key, newValue, i);
                          }}
                          onInputChange={(e, newInputValue) => {
                            inputSetStateFn(key, newInputValue, i);
                          }}
                          renderInput={(params) => (
                            <TextField
                              sx={{ width: "100%" }}
                              {...params}
                              helperText='Search and select from the list or add new'
                              label={value[1].inputTitle}
                              variant='standard'
                              required={isRequired}
                            />
                          )}
                        />
                      </Grid>
                    );

                  if (formTitle === "Builds" || formTitle === "Sales")
                    return (
                      <Grid
                        key={value[1].inputTitle + i}
                        item
                        xs={value[1].gridSize}
                      >
                        {userPreferences.requireInventory ? (
                          <Autocomplete
                            disablePortal
                            options={value[1].inputOptions}
                            value={value[0]}
                            onChange={(e, newValue) => {
                              inputSetStateFn(key, newValue, i);
                            }}
                            onInputChange={(e, newInputValue) => {
                              inputSetStateFn(key, newInputValue, i);
                            }}
                            renderInput={(params) => (
                              <TextField
                                sx={{ width: "100%" }}
                                {...params}
                                helperText='Search and select from the list or add new'
                                label={value[1].inputTitle}
                                variant='standard'
                                required={isRequired}
                              />
                            )}
                          />
                        ) : (
                          <Autocomplete
                            disablePortal
                            freeSolo
                            options={value[1].inputOptions}
                            value={value[0]}
                            onChange={(e, newValue) => {
                              inputSetStateFn(key, newValue, i);
                            }}
                            onInputChange={(e, newInputValue) => {
                              inputSetStateFn(key, newInputValue, i);
                            }}
                            renderInput={(params) => (
                              <TextField
                                sx={{ width: "100%" }}
                                {...params}
                                helperText='Search and select from the list or add new'
                                label={value[1].inputTitle}
                                variant='standard'
                                required={isRequired}
                              />
                            )}
                          />
                        )}
                      </Grid>
                    );
                  return <span key={key + i}></span>;
                default:
                  return null;
              }
            })}

            {currentValue.length !== 1 ? (
              <Grid key={"remove" + i} item xs={1}>
                <IconButton
                  onClick={() => {
                    dynamicRemove(i);
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              </Grid>
            ) : (
              <Grid key={"remove" + i} item xs={1}></Grid>
            )}

            {i === 0 ? (
              <Grid key={"add" + i} item xs={1}>
                <IconButton
                  onClick={() => {
                    dynamicAdd();
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            ) : (
              <Grid key={"add" + i} item xs={1}></Grid>
            )}
          </Grid>
        );
      });
    case "checkbox":
      return (
        <Grid key={inputTitle} item xs={gridSize}>
          <FormControlLabel
            control={
              <Checkbox
                required={isRequired}
                value={currentValue}
                label={inputTitle}
                onChange={() => {
                  inputSetStateFn(!currentValue);
                }}
              />
            }
            label={inputTitle}
          />
        </Grid>
      );
    default:
      return null;
  }
});

function Form(props) {
  const {
    openBool,
    onCloseFn,
    onSubmitFn,
    inputFields,
    formTitle,
    editBool,
    userPreferences,
    dynamicAdd,
    dynamicRemove,
  } = props;

  //useWhyDidYouUpdate("Form", props);

  return (
    <Dialog id={formTitle + "Form"} open={openBool} onClose={onCloseFn}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitFn(editBool);
        }}
      >
        <DialogTitle>
          {editBool ? "Edit " + formTitle : "Add " + formTitle}
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={2}
            justifyContent='center'
            alignItems='stretch'
          >
            {inputFields.map((field) => {
              return (
                <InputComponent
                  key={field.inputTitle}
                  inputType={field.inputType}
                  inputTitle={field.inputTitle}
                  gridSize={field.gridSize}
                  inputOptions={field.inputOptions}
                  currentValue={field.currentValue}
                  inputSetStateFn={field.inputSetStateFn}
                  isRequired={field.isRequired}
                  formTitle={formTitle}
                  userPreferences={userPreferences}
                  dynamicAdd={dynamicAdd}
                  dynamicRemove={dynamicRemove}
                />
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={onCloseFn}>
            Close
          </Button>
          <Button type='submit' variant='contained'>
            {editBool ? "Submit Edit " + formTitle : "Submit " + formTitle}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Form;
