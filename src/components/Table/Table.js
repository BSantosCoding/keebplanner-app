import React, { useEffect, useState, useCallback } from "react";
import PropTypes, { string } from "prop-types";
import {
  TextField,
  Checkbox,
  Slider,
  Typography,
  Popover,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Paper,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  FormControl,
  InputAdornment,
  Input,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { visuallyHidden } from "@mui/utils";
import moment from "moment";
import { DateRangePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { useWhyDidYouUpdate } from "../../hooks/useWhyDidYouUpdate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "../ConfirmationPopup/ConfirmationPopup";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) =>
          headCell.orderable ? (
            <TableCell
              key={headCell.id}
              align='center'
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component='span' sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ) : (
            <TableCell
              key={headCell.id}
              align='center'
              padding={headCell.disablePadding ? "none" : "normal"}
            >
              {headCell.label}
            </TableCell>
          )
        )}
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  headCells: PropTypes.array.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const {
    searchOptions,
    searchCategory,
    searchValue,
    onSearchChange,
    onCategoryChange,
    onFilterClick,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Grid container spacing={2}>
        <Grid container item justifyContent='center' alignItems='center'>
          <Grid item xs={11}>
            <FormControl style={{ width: "10%" }}>
              <InputLabel id='searchCategoryLabel'></InputLabel>
              <Select
                labelId='searchCategoryLabel'
                id='searchCategoryInput'
                value={searchCategory}
                onChange={(e) => {
                  onCategoryChange(e);
                }}
                label='Search Category'
                variant='standard'
              >
                {searchOptions.map((option) => {
                  return (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl style={{ width: "90%" }}>
              <InputLabel id='searchLabel'>
                Search for {searchCategory}
              </InputLabel>
              <Input
                id='search'
                type='text'
                value={searchValue}
                onChange={(e) => {
                  onSearchChange(e);
                }}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton aria-label='search'>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <Tooltip title='Filter list'>
              <IconButton onClick={onFilterClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default function EnhancedTable(props) {
  const {
    defaultOrderBy,
    tableData,
    tableHeadcells,
    editFunction,
    modFunction,
    deleteFunction,
    keyOrder,
    isEditable,
    isDeletable,
    searchOptions,
    filterOptions,
    tableName,
  } = props;
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchCategory, setSearchCategory] = useState(searchOptions[0]);
  const [searchValue, setSearchValue] = useState("");
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const [filterValues, setFilterValues] = useState(() => {
    let temp = {};
    for (const [key, value] of Object.entries(filterOptions)) {
      if (value[0] === "range") temp[key] = value[1];
      if (value[0] === "select") temp[key] = "";
      if (value[0] === "boolean") temp[key] = false;
      if (value[0] === "date") temp[key] = [null, null];
    }
    return temp;
  });

  useEffect(() => {
    let temp = {};
    for (const [key, value] of Object.entries(filterOptions)) {
      if (value[0] === "range") temp[key] = value[1];
      if (value[0] === "select") temp[key] = "";
      if (value[0] === "boolean") temp[key] = false;
      if (value[0] === "date") temp[key] = [null, null];
    }
    setFilterValues(temp);
  }, [filterOptions]);

  const [searchFn, setSearchFn] = useState({
    Fn: (items) => {
      return items;
    },
  });

  const [filterFn, setFilterFn] = useState({
    Fn: (items) => {
      return items;
    },
  });

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteKey, setDeleteKey] = useState(null);

  const handleDeleteConfirmation = useCallback(() => {
    deleteFunction(deleteIndex, deleteKey);
  }, [deleteIndex, deleteKey, deleteFunction]);

  const handleFilterClick = (event) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleChangeSearchValue = (event) => {
    setSearchValue(event.target.value);
    updateSearchFn(searchCategory, event.target.value);
  };

  const handleChangeCategoryValue = (event) => {
    setSearchCategory(event.target.value);
    updateSearchFn(event.target.value, searchValue);
  };

  const updateSearchFn = (category, value) => {
    setSearchFn({
      Fn: (items) => {
        if (value === "") return items;
        else {
          return items.filter((x) => {
            if (typeof x[category] === "string")
              return x[category].toLowerCase().includes(value.toLowerCase());
            else {
              for (const [key, val] of Object.entries(x[category])) {
                if (val.PartName.toLowerCase().includes(value.toLowerCase()))
                  return true;
              }
              return false;
            }
          });
        }
      },
    });
  };

  const updateFilterFn = (filterValues) => {
    setFilterFn({
      Fn: (items) => {
        let tempItems = items;

        for (const [key, value] of Object.entries(filterOptions)) {
          tempItems = tempItems.filter((x) => {
            if (value[0] === "range") {
              return (
                x[key] <= filterValues[key][1] && x[key] >= filterValues[key][0]
              );
            }
            if (value[0] === "select") {
              if (filterValues[key] === "") return true;
              return x[key] === filterValues[key];
            }
            if (value[0] === "date") {
              if (!filterValues[key][0] && !filterValues[key][1]) return true;
              if (!filterValues[key][1])
                return moment(x[key]).isSameOrAfter(
                  moment(filterValues[key][0])
                );
              if (!filterValues[key][0])
                return moment(x[key]).isSameOrBefore(
                  moment(filterValues[key][1])
                );
              return (
                moment(x[key]).isSameOrAfter(moment(filterValues[key][0])) &&
                moment(x[key]).isSameOrBefore(moment(filterValues[key][1]))
              );
            }
            if (value[0] === "boolean") {
              return x[key] === filterValues[key];
            }
            return false;
          });
        }
        return tempItems;
      },
    });
  };

  const handleSliderChange = (event, newValue, activeThumb, key) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    let minDistance =
      filterOptions[key][1][1] - filterOptions[key][1][0] === 0 ? 0 : 1; //(filterOptions[key][1][1] - filterOptions[key][1][0]) * 0.1;
    let tempFilters = filterValues;
    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        tempFilters[key] = [clamped, clamped + minDistance];
        setFilterValues(tempFilters);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        tempFilters[key] = [clamped - minDistance, clamped];
        setFilterValues(tempFilters);
      }
    } else {
      tempFilters[key] = newValue;
      updateFilterFn(tempFilters);
      setFilterValues(tempFilters);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    setTableHeight(document.getElementById("table-paper").clientHeight);
  }, [tableHeight]);

  //useWhyDidYouUpdate("Table",props)
  return (
    <Box sx={{ width: "100%" }}>
      <Paper id='table-paper' sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          searchOptions={searchOptions}
          searchCategory={searchCategory}
          searchValue={searchValue}
          onSearchChange={handleChangeSearchValue}
          onCategoryChange={handleChangeCategoryValue}
          onFilterClick={handleFilterClick}
        />
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table
            stickyHeader
            aria-labelledby='sticky table'
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={tableHeadcells}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(
                searchFn.Fn(filterFn.Fn(tableData)),
                getComparator(order, orderBy)
              )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={row.key}>
                      {keyOrder.map((keyInfo) => {
                        if (keyInfo[1] === "string") {
                          return (
                            <TableCell align='center' key={keyInfo[0]}>
                              {row[keyInfo[0]]}
                              {tableName === "Parts" &&
                                typeof row[keyInfo[0]] === "string" &&
                                row[keyInfo[0]].toLowerCase() === "switch" && (
                                  <IconButton
                                    onClick={() => {
                                      modFunction(row, index);
                                    }}
                                  >
                                    <SettingsIcon />
                                  </IconButton>
                                )}
                            </TableCell>
                          );
                        }
                        if (keyInfo[1] === "boolean") {
                          return (
                            <TableCell align='center' key={keyInfo[0]}>
                              {row[keyInfo[0]] ? <CheckIcon /> : <CloseIcon />}
                            </TableCell>
                          );
                        }
                        if (keyInfo[1] === "link") {
                          return (
                            <TableCell align='center' key={keyInfo[0]}>
                              <Link href={row[keyInfo[0]]} underline='hover'>
                                {row[keyInfo[0]]}
                              </Link>
                            </TableCell>
                          );
                        }
                        if (keyInfo[1] === "nested") {
                          return (
                            <TableCell
                              key={keyInfo[0]}
                              colSpan={3}
                              align='center'
                            >
                              <Table>
                                <TableBody>
                                  {row[keyInfo[0]].map((part) => {
                                    return (
                                      <TableRow key={part.PartKey}>
                                        <TableCell align='center'>
                                          {part.Quantity}
                                        </TableCell>
                                        <TableCell align='center'>
                                          {part.PartName}
                                        </TableCell>
                                        <TableCell align='center'>
                                          {part.Price}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableCell>
                          );
                        }
                        return <span></span>;
                      })}
                      <TableCell>
                        {((tableName === "Parts" && row.Type !== "Modded") ||
                          isEditable) &&
                          !(
                            tableName === "Parts" &&
                            row.Type !== "Modded" &&
                            isEditable
                          ) && (
                            <IconButton
                              onClick={() => {
                                editFunction(row, index);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                        <br />
                        {((tableName === "Parts" && row.Type === "Modded") ||
                          isDeletable) &&
                          !(
                            tableName === "Parts" &&
                            row.Type === "Modded" &&
                            isDeletable
                          ) && (
                            <IconButton
                              onClick={() => {
                                setDeleteIndex(index);
                                setDeleteKey(row.key);
                                setOpenConfirmationDialog(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                  key='emptyRow'
                >
                  <TableCell colSpan={tableHeadcells.length + 1} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{ textAlign: "center" }}
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label='Dense padding'
      />
      <Popover
        open={Boolean(popoverAnchor)}
        onClose={() => {
          setPopoverAnchor(null);
        }}
        anchorEl={popoverAnchor}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          style: { width: 500 },
        }}
      >
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Typography variant='h5'>Filters</Typography>
          </Grid>
          {Object.entries(filterOptions).map(([key, value]) => {
            if (value[0] === "range") {
              return (
                <Grid item xs={6} key={key}>
                  <Typography gutterBottom>{key}</Typography>
                  <Slider
                    style={{ width: "100%" }}
                    id={key}
                    getAriaLabel={() => "Minimum distance shift"}
                    value={filterValues[key]}
                    onChange={(event, newValue, activeThumb) =>
                      handleSliderChange(event, newValue, activeThumb, key)
                    }
                    valueLabelDisplay='auto'
                    getAriaValueText={(value) => {
                      return value;
                    }}
                    disableSwap
                    min={0}
                    max={value[1][1]}
                  />
                </Grid>
              );
            }
            if (value[0] === "select") {
              return (
                <Grid item xs={6} key={key}>
                  <FormControl variant='standard' style={{ width: "100%" }}>
                    <InputLabel id={key + "Label"}>{key}</InputLabel>
                    <Select
                      labelId={key + "Label"}
                      id={key + "Input"}
                      value={filterValues[key]}
                      onChange={(e) => {
                        let tempFilters = filterValues;
                        filterValues[key] = e.target.value;
                        updateFilterFn(tempFilters);
                        setFilterValues(tempFilters);
                      }}
                      label={key}
                    >
                      {value[1].map((x) => {
                        return (
                          <MenuItem key={x} value={x}>
                            {x}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              );
            }
            if (value[0] === "date") {
              return (
                <Grid item xs={12} key={key}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateRangePicker
                      startText={key + " before:"}
                      endText={key + " after:"}
                      value={[filterValues[key][0], filterValues[key][1]]}
                      onChange={(newValue) => {
                        let tempFilters = filterValues;
                        filterValues[key] = newValue;
                        updateFilterFn(tempFilters);
                        setFilterValues(tempFilters);
                      }}
                      renderInput={(startProps, endProps) => (
                        <React.Fragment>
                          <Grid container spacing={2} key={key}>
                            <Grid item xs={6}>
                              <TextField
                                style={{ width: "100%" }}
                                variant='standard'
                                {...startProps}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                style={{ width: "100%" }}
                                variant='standard'
                                {...endProps}
                              />
                            </Grid>
                          </Grid>
                        </React.Fragment>
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              );
            }
            if (value[0] === "boolean") {
              return (
                <Grid item xs={6} key={key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={filterValues[key]}
                        id='booleanCheckbox'
                        label={key}
                        onChange={() => {
                          let tempFilters = filterValues;
                          filterValues[key] = !filterValues[key];
                          updateFilterFn(tempFilters);
                          setFilterValues(tempFilters);
                        }}
                      />
                    }
                    label={key}
                  />
                </Grid>
              );
            }
            return <span></span>;
          })}
        </Grid>
      </Popover>
      <ConfirmDialog
        title='Entry Deletion Confirmation'
        children={<Typography>Do you wish to delete this entry?</Typography>}
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        onConfirm={handleDeleteConfirmation}
      />
    </Box>
  );
}
