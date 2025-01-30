# Codebase Improvement Plan

## Board Size Validation
- [ ] Review and fix hardcoded 8x8 board assumptions throughout codebase
- [ ] Update castling logic to work with variable board sizes
- [ ] Add comprehensive board size validation checks
- [ ] Document board size limitations and requirements

## Castling Implementation
- [ ] Refactor hardcoded castling square positions
- [ ] Implement board-size-aware castling logic
- [ ] Improve castling validation for edge cases
- [ ] Add tests for castling with different board sizes

## En Passant Implementation
- [ ] Review and fix en passant rank validation for different board sizes
- [ ] Strengthen captured pawn position validation
- [ ] Add comprehensive en passant test cases
- [ ] Document en passant limitations and requirements

## King Safety Checks
- [ ] Fix kingless position handling in `movePutsKingInCheck`
- [ ] Add validation for king presence
- [ ] Improve king position tracking
- [ ] Add test cases for king safety edge cases

## State Management
- [ ] Implement immutable state updates
- [ ] Add state history tracking
- [ ] Implement move undo/redo functionality
- [ ] Review and fix direct state mutations

## Move Validation
- [ ] Consolidate move validation logic
- [ ] Remove duplicate validation checks
- [ ] Create centralized validation module
- [ ] Add comprehensive validation test suite

## Type Safety
- [ ] Review and strengthen type assertions
- [ ] Add runtime type validation
- [ ] Improve `charToPiece` type safety
- [ ] Add type validation tests

## Error Handling
- [ ] Add comprehensive error handling
- [ ] Replace silent failures with appropriate errors
- [ ] Create custom error types for different scenarios
- [ ] Add error handling test cases

## Documentation
- [ ] Document board size limitations
- [ ] Add API documentation
- [ ] Document known edge cases
- [ ] Add usage examples 