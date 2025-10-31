# Contributing Guidelines

## Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Submit pull request
4. Code review and approval
5. Merge to main

## Code Standards
- TypeScript strict mode
- ESLint configuration compliance
- Prettier formatting
- Component naming: PascalCase
- File naming: kebab-case

## Commit Convention
```
type(scope): description

feat: add new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: add tests
chore: maintenance
```

## Pull Request Process
- [ ] Feature branch updated with latest main
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] No merge conflicts

## Testing Requirements
- Unit tests for utilities
- Component tests for UI
- Integration tests for workflows
- E2E tests for critical paths

## Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Adequate test coverage
- [ ] Performance considerations
- [ ] Security implications
- [ ] Accessibility compliance
- [ ] Documentation updated

## Branch Protection
- Require pull request reviews
- Require status checks
- Restrict push to main
- Require up-to-date branches